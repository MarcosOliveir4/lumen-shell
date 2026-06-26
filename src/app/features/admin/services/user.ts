import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { IUsers } from './model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseURL = environment.apiUrl;

  public listUsers() {
    return this.httpClient.get<IUsers>(`${this.baseURL}/admin/users`);
  }
}
