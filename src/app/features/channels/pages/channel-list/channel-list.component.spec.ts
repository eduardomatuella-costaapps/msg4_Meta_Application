import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChannelListComponent } from './channel-list.component';
import { MetaIntegrationService } from 'src/app/core/services/meta-integration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ChannelListComponent', () => {
  let component: ChannelListComponent;
  let fixture: ComponentFixture<ChannelListComponent>;
  let metaService: jasmine.SpyObj<MetaIntegrationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const metaServiceSpy = jasmine.createSpyObj('MetaIntegrationService', [
      'redirectToFacebookLogin',
      'getLoginUrl',
      'getAvailablePages',
      'connectPage',
      'disconnectPage'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ChannelListComponent],
      providers: [
        { provide: MetaIntegrationService, useValue: metaServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) }
        }
      ]
    }).compileComponents();

    metaService = TestBed.inject(MetaIntegrationService) as jasmine.SpyObj<MetaIntegrationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(ChannelListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pages on init', () => {
    const mockPages = [
      {
        id: '1',
        name: 'Test Page',
        is_connected: false,
        instagram_business_account: { id: 'ig1', username: 'test_user' }
      }
    ];
    metaService.getAvailablePages.and.returnValue(of(mockPages));

    fixture.detectChanges();

    expect(component.pages.length).toBe(1);
    expect(component.pages[0].name).toBe('Test Page');
  });
});
