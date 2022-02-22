<template>
  <div>
    <div>{{ label }}</div>
    <div class="flex items-center">
      <div class="text-2xl">
        ${{ data }}
      </div>
      <div class="text-xs ml-2">{{ misc }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'LabeledData',
    props: {
      data: {
        type: [String, Number],
        default: '--',
      },
      label: String,
      misc: String,
    }
  }
</script>

<style>
</style>
