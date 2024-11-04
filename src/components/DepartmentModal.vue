<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>부서 선택</h2>
      <input v-model="searchQuery" placeholder="부서 검색" />
      <ul class="department-list">
        <li v-for="department in filteredDepartments" :key="department.id" @click="selectDepartment(department)">
          {{ department.departmentName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    isVisible: Boolean,
    close: Function,
    onSelect: Function
  },
  data() {
    return {
      searchQuery: '',
      departments: []
    };
  },
  computed: {
    filteredDepartments() {
      return this.departments.filter(department =>
          department && department.departmentName && department.departmentName.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await axios.get('/api/departments');
        console.log("부서 목록 : ", response.data);

        if (Array.isArray(response.data)) {
          this.departments = response.data;
        } else {
          console.error("부서 목록이 배열이 아닙니다.", response.data);
          this.departments = [];
        }
      } catch (error) {
        console.error("부서 목록을 가져오는 데 실패했습니다.", error);
        this.departments = [];
      }
    },
    selectDepartment(department) {
      this.onSelect(department);
      this.close();
    },
    closeModal() {
      this.close();
    }
  },
  mounted() {
    this.fetchDepartments();
  }
};
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    animation: slideIn 0.3s;
    position: relative;
  }

  .close {
    cursor: pointer;
    font-size: 24px;
    position: absolute;
    top: 15px;
    right: 15px;
    color: black;
  }

  .department-list {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .department-list li:hover {
    background-color: cadetblue;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>