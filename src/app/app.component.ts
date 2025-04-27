import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  showLayout: boolean = true;

  constructor ( private router: Router) {
    this.router.events.subscribe(event => {
      this.showLayout = this.router.url !== '/auth';
    })
  }
}
