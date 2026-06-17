<!-- VideoSlide.vue -->
<template>
  <div ref="container" class="video-media-player" @click.stop="onPlayerTap">
    <!-- Video Wrapper -->
    <div class="video-wrapper">
      <video
        ref="videoRef"
        class="video-el"
        :poster="currentVideo?.thumbnail"
        playsinline
        webkit-playsinline
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onMetadata"
        @waiting="isBuffering = true"
        @playing="isBuffering = false"
        @canplay="isBuffering = false"
        @ended="onEnded"
      ></video>
    </div>

    <!-- Info do post (overlay inferior esquerdo) -->
    <div class="post-info" :class="{ hidden: showControls }">
      <div v-if="post?.author" class="post-author">
        <img
          v-if="post.author.avatar"
          :src="post.author.avatar"
          class="author-avatar"
        />
        <div v-else class="author-avatar-placeholder">
          {{ post.author.name?.charAt(0) || '?' }}
        </div>
        <div class="author-meta">
          <span class="author-name">{{ post.author.name }}</span>
          <span v-if="post.author.handle" class="author-handle">@{{ post.author.handle }}</span>
        </div>
      </div>
      <p v-if="post?.caption" class="post-caption">{{ post.caption }}</p>
    </div>

    <!-- Overlay de Play (thumbnail inicial) -->
    <Transition name="fade">
      <div v-if="!hasLoaded" class="play-overlay" @click.stop="startVideo()">
        <div v-if="currentVideo?.thumbnail" class="thumb-img-wrap">
          <img :src="currentVideo.thumbnail" class="thumb-img" />
        </div>
      </div>
    </Transition>

    <!-- Loading -->
    <Transition name="fade">
      <div v-if="isBuffering && hasLoaded" class="loading-overlay" @click.stop>
        <div class="spinner"></div>
      </div>
    </Transition>

    <!-- Controls -->
    <Transition name="controls-fade">
      <div v-if="hasLoaded && showControls" class="controls" @click.stop>
        <div
          class="progress-track"
          ref="progressTrack"
          @pointerdown.stop="onScrubStart"
          @click.stop
        >
          <div class="progress-buffer" :style="{ width: bufferedPercent + '%' }" />
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" />
          <div class="progress-thumb" :style="{ left: progressPercent + '%' }" />
        </div>

        <div class="controls-row">
          <button
            class="ctrl-btn"
            @click.stop="togglePlay"
            :aria-label="isPlaying ? 'Pausar' : 'Reproduzir'"
          >
            <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>

          <span class="time-label">
            {{ formatTime(currentTime) }}<span class="time-sep">/</span>{{ formatTime(duration) }}
          </span>

          <div class="ctrl-spacer"></div>

          <button
            class="ctrl-btn"
            @click.stop="toggleMute"
            :aria-label="isMuted ? 'Ativar som' : 'Silenciar'"
          >
            <svg v-if="!isMuted" viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="white" width="22" height="22">
              <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Feedback de tap -->
    <Transition name="fade">
      <div v-if="showTapFeedback" class="tap-feedback" aria-hidden="true">
        <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="white" width="56" height="56">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="white" width="56" height="56">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </div>
    </Transition>
  </div>
</template>

<script>
export default {
  name: 'VideoSlide',
  props: {
    post: { type: Object, required: true },
    currentVideo: { type: Object, required: true },
    hasLoaded: { type: Boolean, default: false },
    isBuffering: { type: Boolean, default: false },
    showControls: { type: Boolean, default: false },
    showTapFeedback: { type: Boolean, default: false },
    isPlaying: { type: Boolean, default: false },
    isMuted: { type: Boolean, default: false },
    currentTime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    progressPercent: { type: Number, default: 0 },
    bufferedPercent: { type: Number, default: 0 },
  },
  emits: [
    'player-tap',
    'start-video',
    'timeupdate',
    'loadedmetadata',
    'ended',
    'scrub-start',
    'toggle-play',
    'toggle-mute'
  ],
  methods: {
    onPlayerTap() { this.$emit('player-tap') },
    startVideo() { this.$emit('start-video') },
    onTimeUpdate(e) { this.$emit('timeupdate', e) },
    onMetadata(e) { this.$emit('loadedmetadata', e) },
    onEnded() { this.$emit('ended') },
    onScrubStart(e) { this.$emit('scrub-start', e) },
    togglePlay() { this.$emit('toggle-play') },
    toggleMute() { this.$emit('toggle-mute') },

    formatTime(seconds) {
      if (!seconds) return '0:00'
      const min = Math.floor(seconds / 60)
      const sec = Math.floor(seconds % 60)
      return `${min}:${sec.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.video-media-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.video-wrapper {
  width: 100%;
  height: 100%;
}

.video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Post Info */
.post-info {
  position: absolute;
  bottom: 70px;
  left: 16px;
  right: 70px;
  color: white;
  z-index: 5;
  transition: opacity 0.3s;
}

.post-info.hidden {
  opacity: 0;
  pointer-events: none;
}

.post-author {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.author-avatar,
.author-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid rgba(255,255,255,0.8);
}

.author-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.author-meta {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  font-size: 16px;
}

.author-handle {
  font-size: 14px;
  opacity: 0.8;
}

.post-caption {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.3;
  text-shadow: 0 1px 3px rgba(0,0,0,0.7);
}

/* Overlays */
.play-overlay,
.loading-overlay,
.tap-feedback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.thumb-img-wrap {
  width: 100%;
  height: 100%;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Controls */
.controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
  padding: 12px 16px 20px;
  z-index: 15;
}

.progress-track {
  position: relative;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  margin-bottom: 12px;
  cursor: pointer;
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #ff2d55;
  border-radius: 2px;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-track:hover .progress-thumb {
  opacity: 1;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: white;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-label {
  color: white;
  font-size: 14px;
  font-family: monospace;
}

.ctrl-spacer {
  flex: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active,
.controls-fade-enter-active,
.controls-fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to,
.controls-fade-enter-from,
.controls-fade-leave-to {
  opacity: 0;
}

/* Tap Feedback */
.tap-feedback {
  pointer-events: none;
  animation: tapScale 600ms ease forwards;
}

@keyframes tapScale {
  0% { transform: scale(0.6); opacity: 0.9; }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 0; }
}
</style>