<template>
  <div class="fixed top-0 left-0 h-full w-full bg-gray-200/90">
    <div class="flex flex-col items-center mt-2 overflow-auto h-full">
      <table class="table-fixed">
        <thead class="bg-orange-200 text-left">
          <th style="width: 112px;">Date</th>
          <th style="width: 112px;">Type</th>
          <th>Description</th>
          <th style="width: 112px;">Amount</th>
        </thead>
        <tbody class="bg-orange-50">
          <tr v-for="(expense, i) in newExpenses" :key="i">
            <td class="pr-4 whitespace-nowrap">{{ expense.date }}</td>
            <td class="pr-4">
              <select v-model="expense.type" style="width: 112px;">
                <option v-for="(type, i) in types" :key="i" :value="type">{{ type }}</option>
              </select>
            </td>
            <td class="pr-4">
              <div style="width: 100%; overflow: auto; white-space: pre; text-overflow: ellipsis;">
                {{ expense.description }}
              </div>
            </td>
            <td>{{ expense.amount }}</td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4 text-center">
        <button class="bg-orange-400 rounded p-2 text-white" @click="submit">Submit</button>
        <div v-if="loading">loading...</div>
      </div>
    </div>
  </div>
</template>

<script>
  import { get, post } from '../fetch';

  export default {
    name: 'UnknownExpenses',
    props: ['expenses'],
    data() {
      return {
        loading: false,
        newExpenses: [],
        types: [],
      }
    },
    watch: {
      expenses: {
        handler() {
          this.newExpenses = this.expenses.map(({ amount, date, description, id, type }) => ({
            amount,
            date,
            description,
            id,
            type,
          }));
        },
        immediate: true,
      }
    },
    async mounted() {
      this.types = await get('/expenseTypes');
      this.types.sort();
    },
    methods: {
      async submit() {
        this.loading = true;
        await Promise.all(this.newExpenses.map((e) => {
          return  post('/updateExpense', {
            body: JSON.stringify(e),
          });
        }));

        this.$emit('done');
        this.loading = false;
      }
    },
  }
</script>

<style>
</style>
