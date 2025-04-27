import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(http: HttpClient) { }

  signIn(){
    // Simulate login request
  }

  register() {
    // Simulate registration request
  }
}
