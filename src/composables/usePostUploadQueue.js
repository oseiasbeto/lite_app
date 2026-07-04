// src/composables/usePostUploadQueue.js
//
// Fila global de publicação. É um singleton (estado a nível de módulo), por
// isso continua a existir e a processar o upload mesmo depois do utilizador
// sair do ecrã de composição — exatamente como o "a publicar..." do X que
// segue o utilizador pelo app.
//
// IMPORTANTE: chama `initPostUploadQueue(store)` UMA VEZ, no App.vue (root),
// antes de qualquer chamada a enqueuePost.

import { reactive } from 'vue';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

const CLOUD_NAME = 'daujoblcc';
const UPLOAD_PRESET = 'social_media_upload';
const API_KEY = '686559434489718';
const API_SECRET = 'oAYl12OIZf2HkieFNDQQk2romHM';

// Estado partilhado por toda a aplicação
const state = reactive({
  queue: [], // { id, status, progress, error, postId, mediaCount, isVideo, _payload }
});

let storeRef = null;

/**
 * Regista a store do Vuex para que a fila consiga despachar 'createPost'.
 * Chamar uma única vez, idealmente no setup() do App.vue.
 */
export function initPostUploadQueue(store) {
  storeRef = store;
}

function getVideoDuration(url) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => resolve(null);
  });
}

async function uploadSingleMedia(media, onProgress) {
  const formData = new FormData();
  formData.append('file', media.file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);
  formData.append('folder', media.type === 'video' ? 'videos' : 'images');

  if (media.type === 'video') {
    formData.append('resource_type', 'video');
    formData.append('public_id', `video_${Date.now()}`);
  }

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
    formData,
    {
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    }
  );

  const data = response.data;
  if (!data) throw new Error('Erro ao carregar mídia.');

  const isVideo = media.type === 'video';
  const thumbnailUrl = isVideo
    ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${data.width},h_${data.height},c_fill,q_auto,f_jpg,so_2/${data.public_id}.jpg`
    : null;

  return {
    public_id: data.public_id,
    url: isVideo
      ? `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/sp_hd/${data.public_id}.m3u8`
      : `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_80,w_1200/${data.public_id}`,
    thumbnail: thumbnailUrl,
    type: media.type,
    format: isVideo ? 'm3u8' : data.format,
    width: data.width,
    height: data.height,
    duration: isVideo ? await getVideoDuration(data.secure_url) : null,
  };
}

async function deleteMediaFromCloudinary(publicId, resourceType = 'image') {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = CryptoJS.SHA1(signatureString).toString();
    await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`,
      { public_id: publicId, api_key: API_KEY, timestamp, signature }
    );
  } catch (err) {
    console.error('Erro ao excluir mídia do Cloudinary:', err);
  }
}

async function runPost(item) {
  const payload = item._payload;
  const uploadedIds = [];

  try {
    item.status = 'uploading';
    item.error = null;

    const total = payload.mediaItems.length || 1;
    const uploadedMedia = [];
    let doneCount = 0;

    for (const media of payload.mediaItems) {
      const result = await uploadSingleMedia(media, (pct) => {
        item.progress = Math.min(90, Math.round(((doneCount + pct / 100) / total) * 90));
      });
      uploadedIds.push(result.public_id);
      uploadedMedia.push(result);
      doneCount += 1;
      item.progress = Math.min(90, Math.round((doneCount / total) * 90));
    }

    item.status = 'posting';
    item.progress = payload.mediaItems.length ? 95 : 60;

    const postData = {
      content: payload.content,
      media: uploadedMedia,
      sharedPost: payload.sharedPostId || null,
      isAnonymous: payload.isAnonymous,
      topics: payload.topics || [],
      audience: payload.audience,
      module: payload.module,
    };

    if (!storeRef) {
      throw new Error(
        'A fila de publicação não foi inicializada. Chama initPostUploadQueue(store) no App.vue.'
      );
    }

    const newPost = await storeRef.dispatch('createPost', postData);

    item.progress = 100;
    item.status = 'success';
    item.postId = newPost?._id || null;

    // Remove automaticamente o indicador de sucesso após alguns segundos
    setTimeout(() => {
      const idx = state.queue.findIndex((p) => p.id === item.id);
      if (idx !== -1 && state.queue[idx].status === 'success') {
        state.queue.splice(idx, 1);
      }
    }, 4000);
  } catch (err) {
    console.error('Erro ao publicar post:', err);
    // Reverte (apaga) qualquer mídia que já tenha sido enviada com sucesso
    await Promise.all(
      uploadedIds.map((pid) => deleteMediaFromCloudinary(pid, item.isVideo ? 'video' : 'image'))
    );
    item.status = 'error';
    item.error =
      err?.response?.data?.error?.message ||
      err?.message ||
      'Erro ao publicar. Toca para tentar novamente.';
  }
}

/**
 * Hook a usar em qualquer componente para ler/alterar a fila de publicação.
 */
export function usePostUploadQueue() {
  function enqueuePost(payload) {
    const item = reactive({
      id: uuidv4(),
      status: 'uploading',
      progress: 0,
      error: null,
      postId: null,
      mediaCount: payload.mediaItems.length,
      isVideo: payload.mediaItems.some((m) => m.type === 'video'),
      _payload: payload,
    });
    state.queue.push(item);
    runPost(item);
    return item.id;
  }

  function retry(id) {
    const item = state.queue.find((p) => p.id === id);
    if (item) {
      item.error = null;
      item.progress = 0;
      runPost(item);
    }
  }

  function dismiss(id) {
    const idx = state.queue.findIndex((p) => p.id === id);
    if (idx !== -1) state.queue.splice(idx, 1);
  }

  return { queue: state.queue, enqueuePost, retry, dismiss };
}