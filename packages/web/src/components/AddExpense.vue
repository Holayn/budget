<template>
  <div class="fixed top-0 left-0 bg-gray-100/90 h-full w-full flex flex-col items-center justify-center" @click="$emit('close')">
    <div class="p-8 bg-white rounded" @click.stop="true">
      <h2 class="text-3xl">Add Expense</h2>
      <div class="grid gap-2 mt-4 w-64">
        <div>
          <label>
            <div>Date</div>
            <input v-model="newExpense.date" class="p-2 border w-full" placeholder="e.g. 2022-02-21">
          </label>
        </div>
        <div>
          <label>
            <div>Type</div>
            <select v-model="newExpense.type" class="p-2 border w-full">
              <option v-for="(type, i) in types" :key="i">{{ type }}</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <div>Description</div>
            <input v-model="newExpense.description" class="p-2 border w-full">
          </label>
        </div>
        <div>
          <label>
            <div>Amount</div>
            <input v-model="newExpense.amount" class="p-2 border w-full">
          </label>
        </div>
        <div class="flex flex-col items-end mt-4 gap-2">
          <button class="px-2 py-3 bg-orange-400 rounded text-white w-full" @click="submitNewExpense">submit</button>
          <div v-if="loadingSubmitNewExpense" class="ml-2 text-xs">Loading...</div>
          <button class="px-2 py-1 bg-gray-400 rounded text-white w-full" @click="$emit('close')">cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import { get, post } from '../fetch';

  export default {
    name: 'AddExpense',
    props: ['date'],
    data() {
      return {
        loadingSubmitNewExpense: false,
        newExpense: {
          amount: null,
          date: null,
          description: null,
          type: null,
        },
        types: [],
      }
    },
    watch: {
      date: {
        handler() {
          this.newExpense.date = moment(this.date).format('yyyy-MM-DD');
        },
        immediate: true,
      }
    },
    async mounted() {
      this.types = await get('/expenseTypes');
    },
    methods: {
      async submitNewExpense() {
        this.loadingSubmitNewExpense = true;
        await post('/addExpense', {
          body: JSON.stringify(this.newExpense),
        });
        this.$emit('done');
        this.loadingSubmitNewExpense = false;
      },
    },
  }
</script>

<style>
</style>
