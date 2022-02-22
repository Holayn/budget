<template>
  <div>
    <h2 class="text-3xl">Add Expense</h2>
      <div class="grid gap-2">
        <div>
          <label>
            <div>Date</div>
            <input v-model="newExpense.date" class="p-2 border" placeholder="e.g. 2022-02-21">
          </label>
        </div>
        <div>
          <label>
            <div>Type</div>
            <select v-model="newExpense.type" class="p-2 border">
              <option v-for="(type, i) in types" :key="i">{{ type }}</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            <div>Description</div>
            <input v-model="newExpense.description" class="p-2 border">
          </label>
        </div>
        <div>
          <label>
            <div>Amount</div>
            <input v-model="newExpense.amount" class="p-2 border">
          </label>
        </div>
        <div class="flex items-end">
          <button class="px-2 py-1 bg-orange-400 rounded text-white" @click="submitNewExpense">submit</button>
          <div v-if="loadingSubmitNewExpense" class="ml-2 text-xs">Loading...</div>
        </div>
      </div>
  </div>
</template>

<script>
  import moment from 'moment';
  import { get, post } from '../fetch';

  export default {
    name: 'AddExpense',
    props: ['onDone'],
    data() {
      return {
        loadingSubmitNewExpense: false,
        newExpense: {
          amount: null,
          date: moment().format('yyyy-MM-DD'),
          description: null,
          type: null,
        },
        types: [],
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
