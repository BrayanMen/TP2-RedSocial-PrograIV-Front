import { Component, signal } from '@angular/core';
import { Navbar } from './shared/components/layout/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './shared/components/layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar,Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('social-network-tp2-front');
}
