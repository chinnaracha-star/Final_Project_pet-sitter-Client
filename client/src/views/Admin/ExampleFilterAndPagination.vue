<script setup>
import { ref, watch, onUnmounted } from "vue";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const endpoint = `${API_BASE_URL}/posts`;

const categories = [
  "Highlight",
  "Cat",
  "Inspiration",
  "General",
];


// ==========================================
// State
// ==========================================

const posts = ref([]);

const search = ref("");
const debouncedSearch = ref("");

const category = ref("Highlight");

const page = ref(1);
const hasMore = ref(true);

const isLoading = ref(false);

const limit = 6;


// ==========================================
// Debounce Search
// ==========================================

let debounceTimer = null;

watch(search, (newValue) => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    debouncedSearch.value = newValue;
  }, 300);
});


// ==========================================
// Request cancellation
// ==========================================

let abortController = null;


// ==========================================
// Fetch Posts
// ==========================================

const fetchPosts = async (
  pageNum,
  currentSearch,
  currentCategory
) => {

  // Cancel previous request
  if (abortController) {
    abortController.abort();
  }

  abortController = new AbortController();

  isLoading.value = true;

  try {

    // Highlight means all categories
    const categoryParam =
      currentCategory === "Highlight"
        ? ""
        : currentCategory;

    const response = await axios.get(
      endpoint,
      {
        params: {
          page: pageNum,
          limit: limit,
          keyword: currentSearch.trim(),
          category: categoryParam,
        },

        signal: abortController.signal,
      }
    );

    const newPosts =
      response.data.posts || [];


    // ======================================
    // Page 1
    // Replace existing posts
    // ======================================

    if (pageNum === 1) {

      posts.value = newPosts;

    }


    // ======================================
    // Page 2+
    // Append posts
    // ======================================

    else {

      posts.value = [
        ...posts.value,
        ...newPosts,
      ];

    }


    // ======================================
    // Check if more pages exist
    // ======================================

    const currentPage =
      response.data.currentPage;

    const totalPages =
      response.data.totalPages;

    hasMore.value =
      currentPage < totalPages;

  }

  catch (error) {

    // Ignore cancelled requests
    if (
      error.name === "CanceledError" ||
      error.code === "ERR_CANCELED"
    ) {
      return;
    }

    console.error(
      "Error fetching posts:",
      error
    );

    if (pageNum === 1) {
      posts.value = [];
    }

  }

  finally {

    isLoading.value = false;

  }
};


// ==========================================
// Reset pagination when search/category
// changes
// ==========================================

watch(
  [debouncedSearch, category],
  () => {

    page.value = 1;

    hasMore.value = true;

  }
);


// ==========================================
// Fetch when page/search/category changes
// ==========================================

watch(
  [
    page,
    debouncedSearch,
    category,
  ],
  () => {

    fetchPosts(
      page.value,
      debouncedSearch.value,
      category.value
    );

  },
  {
    immediate: true,
  }
);


// ==========================================
// Change Category
// ==========================================

const handleCategoryChange = (
  newCategory
) => {

  if (newCategory === category.value) {
    return;
  }

  category.value = newCategory;

};


// ==========================================
// Load More
// ==========================================

const handleLoadMore = () => {

  if (
    isLoading.value ||
    !hasMore.value
  ) {
    return;
  }

  page.value++;

};


// ==========================================
// Clear Search
// ==========================================

const clearSearch = () => {

  search.value = "";

};


// ==========================================
// Cleanup
// ==========================================

onUnmounted(() => {

  clearTimeout(debounceTimer);

  if (abortController) {
    abortController.abort();
  }

});
</script>


<template>

  <div class="posts-container">


    <!-- =================================
         Search
    ================================== -->

    <div class="search-container">

      <input
        v-model="search"
        type="text"
        placeholder="Search posts..."
      />

      <button
        v-if="search"
        @click="clearSearch"
      >
        Clear
      </button>

    </div>


    <!-- =================================
         Categories
    ================================== -->

    <div class="categories">

      <button
        v-for="item in categories"
        :key="item"
        @click="handleCategoryChange(item)"
        :class="{
          active: category === item
        }"
      >
        {{ item }}
      </button>

    </div>


    <!-- =================================
         Posts
    ================================== -->

    <div class="posts-list">

      <!-- No results -->

      <p
        v-if="
          posts.length === 0 &&
          !isLoading
        "
      >
        No posts found.
      </p>


      <!-- Posts -->

      <article
        v-for="post in posts"
        :key="post._id"
        class="post"
      >

        <h2>
          {{ post.title }}
        </h2>

        <p>
          {{ post.description }}
        </p>

        <small>
          Category:
          {{ post.category }}
        </small>

      </article>

    </div>


    <!-- =================================
         Loading
    ================================== -->

    <p v-if="isLoading">
      Loading...
    </p>


    <!-- =================================
         Load More
    ================================== -->

    <button
      v-if="
        !isLoading &&
        hasMore &&
        posts.length > 0
      "
      @click="handleLoadMore"
    >
      Load More
    </button>


    <!-- =================================
         No More Posts
    ================================== -->

    <p
      v-if="
        !isLoading &&
        !hasMore &&
        posts.length > 0
      "
    >
      No more posts.
    </p>

  </div>

</template>


<style scoped>

.posts-container {
  max-width: 800px;
  margin: 0 auto;
}

.search-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.search-container input {
  flex: 1;
  padding: 10px;
}

.categories {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.categories button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.categories button.active {
  background: #222;
  color: white;
}

.posts-list {
  display: grid;
  gap: 16px;
}

.post {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.post h2 {
  margin-top: 0;
}

button {
  cursor: pointer;
}

</style>