import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment'
const url = `${environment.backendUrl}/user`

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string
  authStatusListener = new Subject<boolean>()
  isAuthenticated = false
  private tokenTimer: any;
  userId: string


  constructor(private http: HttpClient, private router: Router) { }

  createUser(email: string, password: string) {
    const authData: AuthData = {email, password}
    this.http.post(url+'/signup', authData).subscribe((res)=> {
      this.router.navigate(['/'])
    }, (error)=> {
      this.authStatusListener.next(false)
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = {email, password}
    this.http.post<{token: string, expiresIn: number, userId: string}>(url+'/login', authData).subscribe((res)=> {
      this.token = res.token
      if(res.token)
      {
        const expiresInDuration = res.expiresIn * 1
        this.tokenTimer = this.setAuthTimer(expiresInDuration)
        this.isAuthenticated = true
        this.userId = res.userId
        this.authStatusListener.next(true)
        const now = new Date()
        const expirationTime = now.getTime() + (expiresInDuration*1000)
        const expirationDate = new Date(expirationTime)
        this.saveAuthData(this.token, expirationDate, this.userId)
        this.router.navigate(['/'])
      }
    }, (error)=> {
      this.authStatusListener.next(false)
    })
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(()=> {
      this.logout()
    }, duration*1000)
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expirationDate.toISOString())
    localStorage.setItem('userId', userId)
  }

  autoAuthUser() {
    const authInformation = this.getAuthData()
    if(!authInformation)
    {
      return;
    }
    const now = new Date()
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime()
    if(expiresIn > 0)
    {
      this.token = authInformation.token
      this.isAuthenticated = true
      this.userId = authInformation.userId
      this.tokenTimer = this.setAuthTimer(expiresIn/1000)
      this.authStatusListener.next(true)
    }
  }

  private getAuthData() {
    const token = localStorage.getItem('token')
    const expirationDate = localStorage.getItem('expiration')
    const userId = localStorage.getItem('userId')
    if(!token || !expirationDate)
    {
      return
    }
    else
    {
      return {
        token,
        expirationDate: new Date(expirationDate),
        userId
      }
    }
  } 

  private clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('expiration')
    localStorage.removeItem('userId')
  }


  logout() {
    this.token = null
    this.isAuthenticated = false
    this.authStatusListener.next(false)
    this.userId = null
    clearTimeout(this.tokenTimer)
    this.clearAuthData()
    this.router.navigate(['/'])
  }
}
