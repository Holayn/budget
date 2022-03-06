<template>
  <main>
    <UnknownExpenses v-if="flags.showUnknownExpenses" :expenses="unknownExpenses" @done="onUnknownExpensesDone"/>
    <section class="bg-orange-100 px-4">
      <Overview ref="overview" @done="fetchData(this.date); $refs.overview.refreshStatus();"/>
    </section>

    <div class="flex justify-center m-4">
      <select v-model="date" class="p-2 rounded border" @change="fetchData(date)">
        <option v-for="({ date }, i) in dates" :key="i" :value="date">
          {{ toDisplayDate(date) }}
        </option>
      </select>
    </div>

    <div class="flex w-full">
      <div :class="getTabClasses('budget')" class="border-b-2 border-orange-400 text-orange-400 px-4 py-2 flex-auto text-center cursor-pointer" @click="tab = 'budget'">Budget</div>
      <div :class="getTabClasses('spending')" class="text-bold text-orange-300 px-4 py-2 flex-auto text-center cursor-pointer" @click="tab = 'spending'">Spending</div>
    </div>

    <section v-if="tab === 'budget'" class="mt-4">
      <div class="px-4">
        <div class="flex">
          <h2 class="text-3xl flex-auto">Budget</h2>
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
            <LabeledData :data="expenses.total" label="Spent" :misc="`${expenses.total < budget.spend ? `$${(budget.spend - expenses.total).toFixed(2)} left out of budget` : `$${(expenses.total - budget.spend).toFixed(2)} over budget`}`"/>
            <LabeledData :data="calculations.totalSpendLeft" label="Remaining"/>
          </div>
          <div class="grid gap-2 mt-2">
            <h3 class="text-2xl">Investing Tracker</h3>
            <LabeledData
              :data="calculations.totalInvestAvailable"
              label="Available"
              :misc="`budget ($${budget.invest}) + balance ($${balance.amount}) - over-spend ($${calculations.overSpendAmount})`"
            />
            <LabeledData :data="invests.total" label="Spent" :misc="`${invests.total > budget.invest ? `$${budget.invest} investment goal met!` : `$${(budget.invest - invests.total).toFixed(2)} still needed to invest`}`"/>
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

    <section v-else-if="tab === 'spending'" class="mt-8">
      <div class="px-4">
        <div class="flex items-center">
          <h2 class="text-3xl">Expenses</h2>
          <button class="flex items-center justify-center bg-orange-400 text-white h-6 w-6 ml-4 rounded" @click="flags.showAddExpense = true">+</button>
        </div>
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

      <div class="mt-8">
        <div class="px-4">
          <div class="flex items-center">
            <h2 class="text-3xl">Investments</h2>
            <button class="flex items-center justify-center bg-orange-400 text-white h-6 w-6 ml-4 rounded" @click="flags.showAddExpense = true">+</button>
          </div>
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
      </div>
    </section>




    <AddExpense v-if="flags.showAddExpense" :date="date" @close="flags.showAddExpense = false" @done="fetchData(this.date); flags.showAddExpense = false;"/>
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
          showAddExpense: false,
          showUnknownExpenses: false,
        },
        invests: {},
        tab: 'budget',
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
      getTabClasses(tab) {
        return {
          'border-b-2': tab === this.tab,
          'border-b-0': tab !== this.tab,
          'border-orange-400': tab === this.tab,
          'text-orange-400': tab === this.tab,
          'text-orange-200': tab !== this.tab,
        }
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
