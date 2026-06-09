import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const pharmacyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isPharmacyStaff() && auth.pharmacyId()) return true;
  router.navigate(['/home']);
  return false;
};
