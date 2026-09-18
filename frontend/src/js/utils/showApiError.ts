import Swal from 'sweetalert2';
import { getBackendErrorMessage } from '@/store/shared/errorMessage';

type ErrorWithResponse = { response?: { data?: unknown }; message?: string };

/** Shows one actionable API/operation error without leaking backend internals. */
export const showApiError = (error: unknown, fallback: string, title = 'Error') => {
  const candidate = error as ErrorWithResponse | null;
  const payload = candidate?.response?.data ?? candidate?.message ?? error;
  void Swal.fire({
    icon: 'error',
    title,
    text: getBackendErrorMessage(payload, fallback),
    confirmButtonText: 'OK',
  });
};
