<template>
  <div>
    <h2>회원가입</h2>

    <div class="form-group">
      <input v-model="user.employeeNumber" placeholder="사원번호"/>
      <div v-if="errors.employeeNumber" class="error-message">{{ errors.employeeNumber }}</div>
    </div>

    <div class="form-group">
      <input type="password" v-model="user.password" placeholder="비밀번호" @input="validatePassword" />
      <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
    </div>

    <div class="form-group">
      <input type="password" v-model="confirmPassword" placeholder="비밀번호 확인" @input="validatePassword" />
      <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
    </div>

    <div class="form-group">
      <input v-model="user.username" placeholder="이름"/>
      <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
    </div>

    <div class="form-group">
      <input v-model="user.phoneNumber" placeholder="전화번호"/>
      <div v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</div>
    </div>

    <div class="form-group">
      <input v-model="departmentName" placeholder="부서명" readonly @click="openDepartmentModal"/>
      <div v-if="errors.departmentId" class="error-message">{{ errors.departmentId }}</div>
    </div>

    <div class="form-group">
      <input v-model="roleName" placeholder="직급" readonly @click="openRoleModal"/>
      <div v-if="errors.roleId" class="error-message">{{ errors.roleId }}</div>
    </div>

    <button @click="register">회원가입</button>

    <DepartmentModal
        :isVisible="isDepartmentModalVisible"
        :close="closeDepartmentModal"
        :onSelect="selectDepartment"
    />

    <RoleModal
        :isVisible="isRoleModalVisible"
        :close="closeRoleModal"
        :onSelect="selectRole"
    />
  </div>
</template>

<script>
import axios from 'axios';
import DepartmentModal from "@/components/DepartmentModal";
import RoleModal from "@/components/RoleModal";

export default {
  components: {
    RoleModal,
    DepartmentModal
  },
  data() {
    return {
      user: {
        employeeNumber: '',
        password: '',
        username: '',
        phoneNumber: '',
        departmentId: null,
        roleId: null
      },
      errors: {},
      confirmPassword: '',
      departmentName: '',
      roleName: '',
      isDepartmentModalVisible: false,
      isRoleModalVisible: false
    };
  },
  methods: {
    openDepartmentModal() {
      this.isDepartmentModalVisible = true;
    },
    closeDepartmentModal() {
      this.isDepartmentModalVisible = false;
    },
    selectDepartment(department) {
      this.user.departmentId = department.id;
      this.departmentName = department.departmentName;
    },
    openRoleModal() {
      this.isRoleModalVisible = true;
    },
    closeRoleModal() {
      this.isRoleModalVisible = false;
    },
    selectRole(role) {
      this.user.roleId = role.id;
      this.roleName = role.roleName;
    },
    validatePassword() {
      this.errors.password = '';
      this.errors.confirmPassword = '';

      const password = this.user.password;
      const confirmPassword = this.confirmPassword;
      const minLength = 8;
      const specialCharacterPattern = /[!@#$%^&*(),.?":{}|<>]/; //특수문자

      if (password.length < minLength) {
        this.errors.password = 'Password must be at least 8 characters long.'
      } else if (!specialCharacterPattern.test(password)) {
        this.errors.password = 'The password must contain at least one special character.'
      } else if (password != confirmPassword) {
        this.errors.confirmPassword = 'Password does not match';
      }
    },
    async register() {
      this.errors = {};

      this.validatePassword();

      if (!this.errors.password && !this.errors.confirmPassword) {
        try {
          await axios.post('/api/users/register', this.user);
          alert('회원가입을 성공하였습니다.');

          this.$router.push({ path: '/' });
        } catch (error) {
          if (error.response && error.response.status === 400) {
            this.errors = error.response.data;
          } else {
            alert(error.response.data.error);
          }
        }
      }
    }
  }
};
</script>

<style scoped>
  .form-group {
    margin-bottom: 15px;
  }

  input {
    width: 40%;
    padding: 10px;
    border: 1px solid green;
    border-radius: 4px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  }

  .error-message {
    color: red;
    margin-top: 5px;
    font-size: 30px;
  }
</style>