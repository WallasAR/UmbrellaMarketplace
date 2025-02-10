import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: false,

  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  placeholder = input('');

  btnClicked = output();
}
