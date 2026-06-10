import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Prescription {
  id: string;
  medicine_id: number;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at?: string;
  Medicine?: { id: number; name: string; requires_prescription?: boolean };
  User?: { email: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private http: HttpClient) {}

  list(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${environment.apiUrl}/prescriptions`);
  }

  upload(medicineId: number, file: File): Observable<Prescription> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.http.post<Prescription>(`${environment.apiUrl}/prescriptions`, {
          medicine_id: medicineId,
          file_name: file.name,
          file_data: base64
        }).subscribe(observer);
      };
      reader.onerror = () => observer.error(reader.error);
      reader.readAsDataURL(file);
    });
  }

  listPending(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${environment.apiUrl}/prescriptions/pending`);
  }

  listPendingForPharmacy(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${environment.apiUrl}/pharmacy/prescriptions/pending`);
  }

  review(id: string, status: 'approved' | 'rejected', notes?: string) {
    return this.http.patch<Prescription>(`${environment.apiUrl}/prescriptions/${id}/review`, { status, notes });
  }

  reviewForPharmacy(id: string, status: 'approved' | 'rejected', notes?: string) {
    return this.http.patch<Prescription>(`${environment.apiUrl}/pharmacy/prescriptions/${id}/review`, { status, notes });
  }

  getStatusForMedicine(prescriptions: Prescription[], medicineId: number): Prescription['status'] | null {
    const match = prescriptions.find((rx) => rx.medicine_id === medicineId);
    return match?.status ?? null;
  }

  isApproved(prescriptions: Prescription[], medicineId: number): boolean {
    return this.getStatusForMedicine(prescriptions, medicineId) === 'approved';
  }
}
