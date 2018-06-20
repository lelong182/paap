import {trigger, state, style, transition, animate, AnimationTriggerMetadata} from "@angular/animations";

export const slideInDownAnimation: AnimationTriggerMetadata =
  trigger('routeAnimation', [
    state('*',
      style({
        opacity: 1,
        transform: 'scale(1) translateY(0)'
      })
    ),
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'scale(1.01) translateY(-50px)'
      }),
      animate('0.2s ease')
    ])
  ]);
