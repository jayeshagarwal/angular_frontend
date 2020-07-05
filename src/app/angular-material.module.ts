import { MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule, MatToolbarModule, MatExpansionModule, MatPaginatorModule, MatDialogModule } from '@angular/material'
import { NgModule } from '@angular/core';

@NgModule({
    exports: [ 
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatPaginatorModule,
        MatDialogModule
    ]
})
export class AngularMaterialModule { }