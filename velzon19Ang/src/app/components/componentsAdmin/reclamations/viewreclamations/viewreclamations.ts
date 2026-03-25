import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Config } from 'src/app/Config/Config';

@Component({
  selector: 'app-viewreclamations',
  standalone: false,
  templateUrl: './viewreclamations.html',
  styleUrl: './viewreclamations.scss',
})
export class Viewreclamations {

  public Config: Config = new Config;
    APIUrl : string = this.Config.getAPIPath();
    
  constructor(private router: Router,  private el: ElementRef,
    private renderer: Renderer2 , public translate  : TranslateService) {
    //translate.setDefaultLang('en');
   
  }

}
