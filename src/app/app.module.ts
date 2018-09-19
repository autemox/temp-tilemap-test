import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { JsonGeneratorComponent } from './json-generator/json-generator.component';
import { SocketService } from '../game/socket/SocketService';

@NgModule({
  declarations: [
    AppComponent,
    JsonGeneratorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]             // boostrap the app component
})
export class AppModule { }
