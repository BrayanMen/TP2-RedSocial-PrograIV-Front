import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';

gsap.registerPlugin(CSSPlugin);

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css'],
})
export class Splash implements AfterViewInit {
  @Output() animationComplete = new EventEmitter<void>();

  @ViewChild('splashContainer', { static: true }) splashContainer!: ElementRef;
  @ViewChild('logoContainer', { static: true }) logoContainer!: ElementRef;
  @ViewChild('textContainer', { static: true }) textContainer!: ElementRef;
  @ViewChild('sloganContainer', { static: true }) sloganContainer!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    gsap.set(this.splashContainer.nativeElement, { opacity: 1, y: 0 });
    gsap.set(this.logoContainer.nativeElement, { opacity: 0, scale: 0.7 });
    gsap.set(this.textContainer.nativeElement.querySelectorAll('.title-letter'), { opacity: 0 });
    gsap.set(this.sloganContainer.nativeElement, { opacity: 0, scaleX: 0.7 });

    this.runCinematicIntro();
  }

  private runCinematicIntro(): void {
    const tl = gsap.timeline({
      paused: true,
      onComplete: () => this.animationComplete.emit(),
    });

    // LOGO ENTRA — fade + scale + blur
    tl.to(this.logoContainer.nativeElement, {
      duration: 1.4,
      rotation: 360,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      ease: 'power3.out',
    });

    // TÍTULO — letra x letra, profundidad y elegancia
    tl.to(
      this.textContainer.nativeElement.querySelectorAll('.title-letter'),
      {
        duration: 0.45,
        y: 0,
        opacity: 1,
        stagger: 0.12,
        ease: 'back.out(1.8)',
        from: {
          y: 40,
          opacity: 0,
          filter: 'blur(10px)',
        },
      },
      '-=0.9'
    );

    // SLOGAN — efecto “rayo de luz”
    tl.to(
      this.sloganContainer.nativeElement,
      {
        duration: 1.2,
        opacity: 1,
        scaleX: 1,
        ease: 'expo.out',
        from: {
          scaleX: 0,
          opacity: 0,
          filter: 'blur(8px)',
        },
      },
      '-=0.6'
    );

    // PAUSA CINEMÁTICA
    tl.to({}, { duration: 0.6 });

    // SALIDA COMPLETA — pantalla deslizándose
    tl.to(this.splashContainer.nativeElement, {
      duration: 1.6,
      yPercent: 100,
      ease: 'power3.inOut',
      filter: 'blur(12px)',
    });

    tl.play();
  }
}
