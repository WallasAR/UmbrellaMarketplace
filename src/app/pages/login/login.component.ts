import { Component, effect, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: false,
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class AuthComponent {
  isLogin = true;
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    effect(() => {
      this.adjustForKeyboard();
    });
  }

  getEmail(value: string) {
    this.email = value;
  }

  getPass(value: string) {
    this.password = value;
  }

  getConfirmPass(value: string) {
    this.confirmPassword = value;
  }

  submitLogin() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha email e senha.';
      return;
    }

    this.loading = true;
    this.authService.signIn(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Credenciais inválidas. Tente novamente.';
      }
    });
  }

  submitRegister() {
    this.errorMessage = '';
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    this.loading = true;
    this.authService.register(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Não foi possível criar a conta.';
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.adjustForKeyboard();
  }

  @HostListener('window:click')
  onClick() {
    this.adjustForKeyboard();
  }

  adjustForKeyboard() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    });
  }

  toggleForm(formType: 'login' | 'register') {
    this.isLogin = formType === 'login';
    this.errorMessage = '';
  }
}
