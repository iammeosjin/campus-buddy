// deno-lint-ignore-file no-explicit-any
// routes/login.tsx
import { useState } from 'preact/hooks';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('/api/login', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      await response.json();

      globalThis.location.href = '/dashboard';
    } else if (response.status === 401) {
      setErrorMessage('Invalid username or password.');
    }
  };

  return (
    <div class='flex h-screen bg-[var(--background-color)]'>
      {/* Left Side: Image */}
      <div class='hidden md:block w-1/2'>
        <img
          src='/img/login.png'
          alt='Campus View'
          class='w-full h-full object-cover'
        />
      </div>

      {/* Right Side: Login Form */}
      <div class='flex justify-center items-center w-full md:w-1/2 p-8 bg-white shadow-lg'>
        <form
          method='POST'
          action='/api/login'
          onSubmit={onSubmit}
          class='flex flex-col space-y-6 w-full max-w-sm'
        >
          <h1 class='text-center text-3xl font-extrabold text-[var(--primary-color)] tracking-tight'>
            Welcome Back!
          </h1>

          {/* Display Error Message if Exists */}
          {errorMessage && (
            <p class='text-[var(--error-color)] text-center font-semibold text-lg'>
              {errorMessage}
            </p>
          )}

          <label class='text-[var(--text-color)] font-medium text-lg'>
            Username:
            <input
              type='text'
              name='username'
              required
              class='border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-[var(--highlight-color)] text-base font-normal'
            />
          </label>

          <label class='text-[var(--text-color)] font-medium text-lg'>
            Password:
            <input
              type='password'
              name='password'
              required
              class='border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-[var(--highlight-color)] text-base font-normal'
            />
          </label>

          <button
            type='submit'
            class='button-primary w-full py-3 text-lg font-bold tracking-wide hover:shadow-md hover:opacity-90 transition'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
