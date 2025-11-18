import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import gsap from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';

gsap.registerPlugin(CSSPlugin);

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading implements AfterViewInit, OnDestroy {
  private animation?: gsap.core.Tween;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const circles = this.el.nativeElement.querySelectorAll('.loader-circle');

    // Animación orbital y de escala perpetua
    this.animation = gsap.to(circles, {
      scale: 2.5,
      opacity: 0,
      duration: 1.5,
      stagger: 0.3, // Retraso entre cada onda
      repeat: -1, // Infinito
      ease: 'power1.out', // Expansión suave
    });
  }

  ngOnDestroy() {
    // Limpieza de memoria crucial
    this.animation?.kill();
  }
}
