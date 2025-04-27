import { Component, effect, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

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
  isLogin: boolean = true;
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  constructor () {
    effect((
      () => {
        this.adjustForKeyboard();
      }
    ))
  }

  getEmail(value: string) {
    this.email = value;
  }

  getPass(value: string) {
    this.password = value;
  }

  login() {

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.adjustForKeyboard();
  }

  @HostListener('window:click', ['$event'])
  onClick(event: any) {
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
  }
}
