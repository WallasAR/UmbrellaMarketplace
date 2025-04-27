import { Component, input, output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: false,

  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  isPasswordVisible: boolean = false;
  placeholder = input('');
  iconRight = input(false);
  icon = input('');

  btnClicked = output();
  getInputValue = output<string>();

  getInput(event: Event){
    const value = (event.target as HTMLInputElement).value
    this.getInputValue.emit(value);
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
