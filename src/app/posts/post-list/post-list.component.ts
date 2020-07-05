import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = []
  private postsSub: Subscription
  isLoading = false
  postsPerPage = 5
  totalPosts = 20
  currentPage = 1
  pageSizeOptions = [1,2,5,10]
  private authStatusSub: Subscription
  userIsAuthenticated = false
  userId: string

  constructor(private postsService: PostsService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
    this.userId = this.authService.userId
    this.postsSub = this.postsService.postsUpdated.subscribe((postData: {posts:Post[], postCount: number})=> {
      this.isLoading = false
      this.posts = postData.posts
      this.totalPosts = postData.postCount
    })
    this.userIsAuthenticated = this.authService.isAuthenticated
    this.authStatusSub = this.authService.authStatusListener.subscribe((isAuthenticated)=> {
      this.userIsAuthenticated = isAuthenticated
      this.userId = this.authService.userId
    })
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
  }

  onDeletePost(postId: string) {
    this.isLoading = true
    this.postsService.deletePost(postId).subscribe(()=> {
      this.postsService.getPosts(this.postsPerPage, 0)
    }, ()=> {
    this.isLoading = false
    })
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe()
    this.authStatusSub.unsubscribe()
  }

}
