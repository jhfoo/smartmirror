<template>
  <Suspense>
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
  </Suspense>
</template>

<style>
</style>

<script>
export default {
  setup () {
    const $q = useQuasar()

    // calling here; equivalent to when component is created
    $q.dark.set(true)
  }
}
</script>