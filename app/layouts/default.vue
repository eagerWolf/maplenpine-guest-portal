<template>
  <div class="min-h-screen bg-stone-50">
    <NavBar />
    <main class="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div class="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
        <AdminSectionSidebar />
        <div class="min-w-0 flex-1"><slot /></div>
      </div>
    </main>
  </div>
</template>
