declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    role: 'admin' | 'staff'
  }
}

export {}
