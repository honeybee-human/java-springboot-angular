import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DiaryComponent } from './components/diary.component';
import { BookComponent } from './components/book.component';
import { DiaryService } from './services/diary.service';
import { BookService } from './services/book.service';

@NgModule({
  declarations: [
    AppComponent,
    DiaryComponent,
    BookComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    DiaryService,
    BookService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }