<template>
  <div class="max-w-4xl mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">Rich Editor</h2>
    <div class="flex justify-between mb-4">
      <button @click="boldText" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-bold"></i>
      </button>
      <button @click="italicText" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-italic"></i>
      </button>
      <button @click="underlineText" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-underline"></i>
      </button>
      <button @click="insertList" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-list"></i>
      </button>
      <button @click="insertQuote" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-quote-left"></i>
      </button>
    </div>
    <div
      class="editor"
      contenteditable="true"
      @input="updateContent"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
    >
      <div v-html="content"></div>
    </div>
    <div v-if="showMentionList" class="mention-list">
      <ul>
        <li v-for="user in filteredUsers" :key="user.id" @click="mentionUser(user)">
          {{ user.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
//import DOMPurify from 'dompurify';

const content = ref('');
const users = [
  { id: 1, name: 'João' },
  { id: 2, name: 'Maria' },
  { id: 3, name: 'Pedro' },
  { id: 4, name: 'Luana' },
  { id: 5, name: 'Carlos' },
];
const mentionedUsers = ref([]);
const showMentionList = ref(false);
const mentionQuery = ref('');

const filteredUsers = computed(() => {
  return users.filter((user) => user.name.toLowerCase().includes(mentionQuery.value.toLowerCase()) && !mentionedUsers.value.includes(user));
});

const updateContent = (event) => {
  let html = event.target.innerHTML;
  html = linkify(html);
  html = mentionify(html);
  content.value = html;
  checkMentionList();
};

const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const br = document.createElement('br');
    range.insertNode(br);
    range.setStartAfter(br);
    range.setEndAfter(br);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const handleKeyup = (event) => {
  checkMentionList();
};

const boldText = () => {
  document.execCommand('bold', false, null);
};

const italicText = () => {
  document.execCommand('italic', false, null);
};

const underlineText = () => {
  document.execCommand('underline', false, null);
};

const insertList = () => {
  document.execCommand('insertOrderedList', false, null);
};

const insertQuote = () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const quote = document.createElement('blockquote');
  quote.innerHTML = range.toString();
  range.deleteContents();
  range.insertNode(quote);
};

const linkify = (html) => {
  return html.replace(/(https?:\/\/[^\s]+)/g, (match) => {
    return `<a href="${match}" target="_blank">${match}</a>`;
  });
};

const mentionify = (html) => {
  return html.replace(/@([a-zA-Z0-9]+)/g, (match, name) => {
    const user = users.find((user) => user.name.toLowerCase() === name.toLowerCase());
    if (user) {
      if (!mentionedUsers.value.includes(user)) {
        mentionedUsers.value.push(user);
      }
      return `<span style="color: blue;">@${user.name}</span>`;
    }
    return match;
  });
};

const checkMentionList = () => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const text = range.startContainer.textContent;
  if (text.includes('@')) {
    const query = text.substring(text.indexOf('@') + 1);
    mentionQuery.value = query;
    showMentionList.value = true;
  } else {
    showMentionList.value = false;
  }
};

const mentionUser = (user) => {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const mention = document.createTextNode(`@${user.name} `);
  range.insertNode(mention);
  if (!mentionedUsers.value.includes(user)) {
    mentionedUsers.value.push(user);
  }
  showMentionList.value = false;
};
</script>

<style scoped>
.editor {
  border: 1px solid #ccc;
  padding: 10px;
  width: 100%;
  height: 200px;
  overflow-y: auto;
}

.mention-list {
  position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  width: 200px;
}

.mention-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mention-list li {
  cursor: pointer;
}

.mention-list li:hover {
  background-color: #f0f0f0;
}
</style>
