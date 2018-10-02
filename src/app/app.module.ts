import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { JsonGeneratorComponent } from './json-generator/json-generator.component';
import { SocketService } from '../game/socket/SocketService';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from './partials/header/header.component';
import { FooterComponent } from './partials/footer/footer.component';
import { OverlayComponent } from './overlay/overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    JsonGeneratorComponent,
    HeaderComponent,
    FooterComponent,
    OverlayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot(),
    FontAwesomeModule
  ],
  providers: [SocketService],
  bootstrap: [AppComponent]             // boostrap the app component
})
export class AppModule { }
