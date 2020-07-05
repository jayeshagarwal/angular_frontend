import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment'

const url = `${environment.backendUrl}/posts`;

@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = []
    postsUpdated = new Subject<{posts: Post[], postCount: number}>()

    constructor(private http: HttpClient, private router: Router) {}

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`
        this.http.get<{message: string, posts: Post[], maxPosts: number}>(url+queryParams).subscribe((postData)=> {
            this.posts = postData.posts
            this.postsUpdated.next({posts: this.posts.slice(), postCount: postData.maxPosts})
        })
    }

    getPost(id: string) {
        return this.http.get<Post>(url+"/"+id)
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData()
        postData.append('title', title)
        postData.append('content', content)
        postData.append('image', image, title)
        this.http.post<{message: string, post: Post}>(url, postData)
        .subscribe((data)=> {
            this.router.navigate(['/'])
        })
    }

    updatePost(id: string, title: string, content: string, image: string | File,) {
        let post: Post | FormData
        if(typeof(image) === 'object') {
            post = new FormData()
            post.append('image', image, title)
            post.append('title', title)
            post.append('content', content)
        }
        else
        {
            post = {_id: id, title, content, imagePath: image ,creator: null}
        }
        this.http.put(url+'/'+id, post).subscribe(()=> {
            this.router.navigate(['/'])
        })
    }

    deletePost(id: string) {
        return this.http.delete(url+"/"+id)
    }
}