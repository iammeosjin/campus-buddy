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
    <div class='flex justify-center items-center h-screen bg-[var(--background-color)]'>
      <form
        method='POST'
        action='/api/login'
        onSubmit={onSubmit}
        class='flex flex-col space-y-4 bg-white p-8 shadow-lg rounded-lg w-96'
      >
        <h1 class='header-title text-center mb-4'>Login</h1>

        {/* Display Error Message if Exists */}
        {errorMessage && (
          <p class='text-[var(--error-color)] text-center font-medium'>
            {errorMessage}
          </p>
        )}

        <label class='text-[var(--text-color)] font-medium'>
          Username:
          <input
            type='text'
            name='username'
            required
            class='border border-gray-300 p-2 w-full rounded'
          />
        </label>

        <label class='text-[var(--text-color)] font-medium'>
          Password:
          <input
            type='password'
            name='password'
            required
            class='border border-gray-300 p-2 w-full rounded'
          />
        </label>

        <button type='submit' class='button-primary w-full'>
          Login
        </button>
      </form>
    </div>
  );
}
