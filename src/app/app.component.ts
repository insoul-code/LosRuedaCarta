import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertService } from './services/alert.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  showAlert = false;
  message = '';

  constructor(
    private alertService: AlertService){
    }
  ngOnInit(): void {
    this.alertService.alert$.subscribe((res:any) => {
      this.message = res.message;
      this.showAlert = true;
      setTimeout(()=>{this.showAlert = false}, res.time)
    });
  }

}
