<template>
  <div class="min-h-screen bg-stone-50">
    <NavBar />
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-start gap-6">
        <AdminSectionSidebar />
        <div class="min-w-0 flex-1"><slot /></div>
      </div>
    </main>
  </div>
</template>
