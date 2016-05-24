import { provide } from '@angular/core';
import { Component, AfterViewChecked } from '@angular/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { HTTP_PROVIDERS } from '@angular/http';
import { RequestOptions, BaseRequestOptions } from '@angular/http';

// Services
import { ApplicationService } from './services/application.service';
import { LoginService } from './services/login.service';
import { LoggedInRouterOutlet } from './directives/loggedinrouter.directive';

// Pages
import { LoginPageComponent } from './pages/login.page.component';
import { MarketplacePageComponent } from './pages/marketplace.page.component';
import { ApplianceDetailPageComponent } from './pages/appliance-detail.page.component';
import { HomeComponent } from './pages/home.component';

// Components
import { DashboardComponent } from './components/dashboard.component';
import { CloudLaunchComponent } from './components/cloudlaunch.component';

declare var $: any

class CustomRequestOptions extends BaseRequestOptions {
  constructor () {
    super();
    let auth_header = "Token " + sessionStorage.getItem('token') || localStorage.getItem('token');
    this.headers.append('Authorization', auth_header);
  }
}

@Component({
   selector: 'cloudlaunch-app',
   template: `
        <!-- The router-outlet displays the template for the current component based on the URL -->
        <router-outlet></router-outlet>
    `,
   directives: [LoggedInRouterOutlet],
   providers: [
      ROUTER_PROVIDERS,
      HTTP_PROVIDERS,
      provide(RequestOptions, { useClass: CustomRequestOptions }),
      LoginService, ApplicationService
   ]
})

@RouteConfig([
   { path: '/home', name: 'Home', component: HomeComponent },
   { path: '/login', name: 'Login', component: LoginPageComponent },
   { path: '/dashboard', name: 'Dashboard', component: DashboardComponent },
   { path: '/marketplace', name: 'Marketplace', component: MarketplacePageComponent, useAsDefault: true },
   { path: '/marketplace/appliance/:slug/', name: 'ApplianceDetail',
     component: ApplianceDetailPageComponent },
   // { path: '/marketplace/appliance/:slug/launch', name: 'Launch',
   //   component: CloudLaunchComponent }
])

export class AppComponent implements AfterViewChecked {
   
   ngAfterViewChecked() {
      // Unfortunately, there's no single place to apply material effects
      // and it's therefore done during this lifecycle method.
      $.material.init();
      // A particularly nasty workaround to apply dropdown effects globally.
      // Dropdown.js can only be called once per dropdown, after which it
      // caches state. Therefore, the .dropdown() function should be called
      // after the dropdown is populated. However, whether or not an element
      // has been populated is context/application specific and difficult to
      // determine globally. Therefore, the heuristic is to call .dropdown()
      // only if it actually has elements. If however, option elements are
      // dynamically added later, this logic will not work and the dropdown
      // will not update itself to reflect those changes.
      var selectElem = $("select");
      selectElem.find("option").each(function() {
          if ($(this).length > 0)
            selectElem.dropdown();

        });
   }
}
