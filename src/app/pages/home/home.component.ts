import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SymptomOption, SymptomService } from '../../services/symptom.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  symptoms: SymptomOption[] = [];

  constructor(
    private symptomService: SymptomService,
    private router: Router
  ) {}

  ngOnInit() {
    this.symptomService.list().subscribe({
      next: (items) => this.symptoms = items ?? [],
      error: () => this.symptoms = []
    });
  }

  searchBySymptom(symptomId: string) {
    this.router.navigate(['/home'], { queryParams: { symptom: symptomId } });
  }
}
