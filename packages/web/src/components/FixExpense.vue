<template>
  <div class="fixed top-0 left-0 h-full w-full bg-gray-200/90">
    <div class="flex flex-col items-center mt-2 overflow-auto h-full" @click="$emit('close')">
      <div class="mt-4 p-4 bg-orange-100" @click.stop="true">
        <div class="flex justify-end cursor-pointer" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
        <div class="flex flex-col gap-4">
          <div>
            <div class="font-bold">Description</div>
            <div>{{ expense.description }}</div>
          </div>
          <div>
            <div class="font-bold">Type</div>
            <div>{{ expense.type }}</div>
          </div>
          <div>
            <div class="font-bold">Date</div>
            <div>{{ expense.date }}</div>
          </div>
          <div>
            <div class="font-bold">Amount</div>
            <input v-model="newAmount"/>
          </div>
        </div>
        <div class="mt-4 text-center">
          <button class="bg-orange-400 rounded p-2 text-white" @click="submit">Submit</button>
          <div v-if="loading">loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { post } from '../fetch';

  export default {
    name: 'FixExpense',
    props: ['expense'],
    data() {
      return {
        loading: false,
        newAmount: null,
      }
    },
    mounted() {
      this.newAmount = this.expense.amount / 2;
    },
    methods: {
      async submit() {
        this.loading = true;
        await post('/fixExpense', {
            body: JSON.stringify({
              id: this.expense.id,
              amount: this.newAmount,
            }),
        });

        this.$emit('amount', this.newAmount);
        this.$emit('close');
        this.loading = false;
      }
    },
  }
</script>

<style>
</style>
