<template>
  <main>
    <UnknownExpenses v-if="flags.showUnknownExpenses" :expenses="unknownExpenses" @done="onUnknownExpensesDone"/>
    <section class="bg-orange-100 px-4">
      <Overview ref="overview" @done="fetchData(this.date); $refs.overview.refreshStatus();"/>
    </section>
    <section class="mt-4">
      <div class="px-4">
        <div class="flex">
          <h2 class="text-3xl flex-auto">Budget</h2>
          <div class="flex flex-col items-center">
            <div>
              <select v-model="date" class="p-2 rounded border" @change="fetchData(date)">
                <option v-for="({ date }, i) in dates" :key="i" :value="date">
                  {{ toDisplayDate(date) }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="grid gap-8">
          <div class="grid gap-2 mt-2">
            <LabeledData :data="budget.total" label="Total Spending Available"/>
            <div class="flex gap-4">
              <LabeledData :data="budget.spend" label="Free Spend"/>
              <LabeledData :data="budget.invest" label="Invest"/>
              <LabeledData :data="budget.fixed" label="Fixed"/>
            </div>
          </div>
          <div class="grid gap-2 mt-2">
            <h3 class="text-2xl">Free Spending Tracker</h3>
            <LabeledData
              :data="calculations.totalSpendAvailable"
              label="Available"
              :misc="`budget ($${budget.spend}) + balance ($${balance.amount}) - over-investment ($${calculations.overInvestAmount})`"
            />
            <LabeledData :data="calculations.totalSpendLeft" label="Remaining"/>
          </div>
          <div class="grid gap-2 mt-2">
            <h3 class="text-2xl">Investing Tracker</h3>
            <LabeledData
              :data="calculations.totalInvestAvailable"
              label="Available"
              :misc="`budget ($${budget.invest}) + balance ($${balance.amount}) - over-spend ($${calculations.overSpendAmount})`"
            />
            <LabeledData :data="invests.total" label="Spent" :misc="`${invests.total > budget.invest ? `$${budget.invest} investment goal met!` : `$${budget.invest - invests.total} still needed to invest`}`"/>
            <LabeledData :data="calculations.totalInvestLeft" label="Remaining"/>
          </div>
          <div class="grid gap-2 mt-2">
            <h3 class="text-2xl">Fixed Expenses</h3>
            <LabeledData :data="budget.fixed" label="Amount"/>
            <table v-if="budget.fixed > 0">
              <thead class="bg-orange-200 text-left">
                <th class="text-left">Description</th>
                <th class="text-left">Amount</th>
              </thead>
              <tbody class="bg-orange-50">
                <tr v-for="(expense, i) in fixedExpenses" :key="i">
                  <td class="text-left pr-4">{{ expense.description }}</td>
                  <td class="text-left">${{ expense.amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <section class="mt-8">
      <div class="px-4">
        <h2 class="text-3xl">Expenses</h2>
        <LabeledData class="mt-2" :data="expenses.total" label="Total"/>
        <div class="mt-2 overflow-auto">
          <table v-if="expenses.total > 0">
            <thead class="bg-orange-200 text-left">
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
            </thead>
            <tbody class="bg-orange-50">
              <tr v-for="(expense, i) in expenses.expenses" :key="i">
                <td class="pr-4 whitespace-nowrap">{{ expense.date }}</td>
                <td class="pr-4">{{ expense.type }}</td>
                <td class="pr-4">{{ expense.description }}</td>
                <td>{{ expense.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </section>
      <section class="mt-8">
        <div class="px-4">
          <h2 class="text-3xl">Investments</h2>
          <LabeledData class="mt-2" :data="invests.total" label="Total"/>
          <table v-if="invests.total > 0">
            <thead class="bg-orange-200 text-left">
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
            </thead>
            <tbody class="bg-orange-50">
              <tr v-for="(invest, i) in invests.invests" :key="i">
                <td class="pr-2">{{ invest.date }}</td>
                <td class="pr-2">{{ invest.description }}</td>
                <td>{{ invest.amount }}</td>
              </tr>
            </tbody>
          </table>
        </div>
    </section>
    <section class="mt-8">
      <div class="px-4">
        <AddExpense :date="date" @done="fetchData(this.date)"/>
      </div>
    </section>
  </main>
</template>

<script>
  import moment from 'moment';
  import AddExpense from '../AddExpense.vue';
  import LabeledData from '../LabeledData.vue';
  import Overview from '../Overview.vue';
  import UnknownExpenses from '../UnknownExpenses.vue';
  import { get, post } from '../../fetch';
  import { EXPENSE_UNKNOWN } from '../../globals';

  export default {
    name: 'Main',
    components: {
      AddExpense,
      LabeledData,
      Overview,
      UnknownExpenses,
    },
    data() {
      return {
        balance: {},
        budget: {},
        calculations: {},
        date: moment().startOf('month').format('yyyy-MM-DD'),
        dates: [],
        expenses: {},
        fixedExpenses: {},
        flags: {
          loading: false,
          showUnknownExpenses: false,
        },
        invests: {},
      }
    },
    watch: {
      unknownExpenses() {
        this.flags.showUnknownExpenses = !!this.unknownExpenses.length;
      }
    },
    async created() {
      await this.fetchData(this.date);
      this.dates = await get('/getDates');
    },
    computed: {
      unknownExpenses() {
        return this.expenses.expenses?.filter(e => e.type === EXPENSE_UNKNOWN) ?? [];
      },
    },
    methods: {
      async fetchData(date) {
        this.date = date;
        this.flags.loading = true;
        this.balance = await get(`/getBalance?date=${date}`);
        this.budget = await get(`/getBudget?date=${date}`);
        this.calculations = await get(`/calculations?date=${date}`);
        this.expenses = await get(`/getExpenses?date=${date}`);
        this.fixedExpenses = await get(`/getFixedExpenses?date=${date}`);
        this.invests = await get(`/getInvests?date=${date}`);
        this.flags.loading = false;
      },
      onUnknownExpensesDone() {
        this.flags.showUnknownExpenses = false;
        this.fetchData(this.date);
      },
      toDisplayDate(date) {
        return moment(date).format('MMMM YYYY');
      },
    },
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
