import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,

  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  label = input('label');
  bgColor = input('bg-black');
  hoverColor = input('hover:bg-gray-800');

  btnClicked = output();
}
