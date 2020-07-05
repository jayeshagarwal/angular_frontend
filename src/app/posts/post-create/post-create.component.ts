import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { PostsService } from '../posts.service';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../post.model';
import { mimeType } from './mime-type.validator'
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
    posts = []
    postId: string;
    private mode = 'create'
    post: Post
    form: FormGroup
    imagePreview: string
    isLoading = false
    private authStatusSub: Subscription

    constructor(private postsService: PostsService, private route: ActivatedRoute, private authService: AuthService) { }

    ngOnInit() {
        this.authStatusSub = this.authService.authStatusListener.subscribe((authStatus)=> {
            this.isLoading = false
        })
        this.form = new FormGroup({
            'title': new FormControl(null, {
                validators: [Validators.required, Validators.minLength(3)]
            }),
            'content': new FormControl(null, {validators: [Validators.required]}),
            'image': new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
        })
        if(this.route.snapshot.params.id) {
            this.mode = 'edit'
            this.isLoading = true
            this.postId = this.route.snapshot.params.id
            this.postsService.getPost(this.postId).subscribe((postData)=> {
                this.isLoading = false
                this.post = postData
                this.form.setValue({
                    'title': this.post.title,
                    'content': this.post.content,
                    'image': this.post.imagePath
                })
            })
        }
        else
        {
            this.mode = 'create'
            this.postId = null
        }
    }

    onImagePicked(event: Event) {
        const file = (event.target as HTMLInputElement).files[0]
        this.form.patchValue({ 'image': file })
        this.form.get('image').updateValueAndValidity()
        const reader = new FileReader()
        reader.onload = ()=> {
            this.imagePreview = <string>reader.result
        }
        reader.readAsDataURL(file)
    }

    onSavePost()
    {
        if(this.form.invalid) 
        {
            return;
        }
        this.isLoading = true
        if(this.mode === 'edit')
        {
            this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image)
        }
        else
        {
            this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image)
        }
        this.form.reset()
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe()
    }
}