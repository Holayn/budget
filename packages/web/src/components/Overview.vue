<template>
  <div class="flex flex-col p-4">
    <button class="bg-orange-400 rounded p-2 text-white" :class="{ 'bg-orange-500': isUpdatingExpenses }" @click="updateExpenses">Update Expenses</button>

    <div class="mt-4">
      <LabeledData :data="status.amount" label="Balance"/>
    </div>

    <div class="mt-4">
      <div>Investing Goal Status:</div>
      <div class="text-xl">
        <div v-if="status.investStatus > 0" class="text-red-500">
          Behind by ${{ status.investStatus.toFixed(2) }}
        </div>
        <div v-else-if="status.investStatus < 0" class="text-green-500">
          Ahead by ${{ status.investStatus.toFixed(2) * -1 }}
        </div>
        <div v-else class="text-green-500">
          Investment goal currently met!
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div>Spending Status:</div>
      <div class="text-xl">
        <div v-if="status.spendStatus >= 0" class="text-green-500">
          Underspent by ${{ status.spendStatus.toFixed(2) }}
        </div>
        <div v-else-if="status.spendStatus < 0" class="text-red-500">
          Overspent by ${{ status.spendStatus.toFixed(2) * -1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import moment from 'moment';

  import LabeledData from './LabeledData.vue';
  import { get } from '../fetch';

  export default {
    name: 'Overview',
    components: {
      LabeledData,
    },
    data() {
      return {
        status: {},
        isUpdatingExpenses: false,
      }
    },
    async created() {
      this.status = await get(`/status`);
    },
    methods: {
      async updateExpenses() {
        this.isUpdatingExpenses = true;
        await get('/updateExpenses');
        this.$emit('done');
        this.isUpdatingExpenses = false;
      },
    },
  }
</script>

<style>
</style>

