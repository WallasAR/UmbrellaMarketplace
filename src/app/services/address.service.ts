import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Address } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private addressesSubject = new BehaviorSubject<Address[]>([]);
  readonly addresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${environment.apiUrl}/addresses`).pipe(
      tap((addresses) => this.addressesSubject.next(addresses))
    );
  }

  addAddress(address: Partial<Address>): Observable<Address> {
    return this.http.post<Address>(`${environment.apiUrl}/addresses`, address).pipe(
      tap(() => this.fetchAddresses().subscribe())
    );
  }

  removeAddress(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/addresses/${id}`).pipe(
      tap(() => this.fetchAddresses().subscribe())
    );
  }

  setDefaultAddress(id: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/addresses/${id}/default`, {}).pipe(
      tap(() => this.fetchAddresses().subscribe())
    );
  }

  getAddressesValue(): Address[] {
    return this.addressesSubject.value;
  }
}
