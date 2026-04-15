import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit, AfterViewInit {

    loginForm!: UntypedFormGroup;
    submitted     = false;
    loading       = false;
    error         = '';
    fieldTextType = false;
    year          = new Date().getFullYear();

    // Comptes démo affichés dans le template
    demoUsers = [
        { email: 'admin@tijara.tn',  password: 'admin123',    role: 'admin'  },
        { email: 'vendor@tijara.tn', password: 'password',    role: 'vendor' },
        { email: 'user@tijara.tn',   password: 'password123', role: 'user'   },
    ];

    googleLoading = false;

    constructor(
        private fb: UntypedFormBuilder,
        private router: Router,
        private api: TijaraApiService,
        private ngZone: NgZone,
    ) {
        // Si déjà connecté, rediriger directement
        try {
            const raw = localStorage.getItem('currentUser');
            if (raw) {
                const user = JSON.parse(raw);
                if (user?.role) { this.redirectByRole(user.role); }
            }
        } catch {
            localStorage.removeItem('currentUser');
        }
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email:    ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    ngAfterViewInit(): void {
        this.initGoogleSignIn();
    }

    initGoogleSignIn(): void {
        try {
            google.accounts.id.initialize({
                client_id: environment.googleClientId,
                callback: (response: any) => {
                    this.ngZone.run(() => this.handleGoogleCredential(response.credential));
                }
            });
            google.accounts.id.renderButton(
                document.getElementById('google-btn-login'),
                { theme: 'outline', size: 'large', width: 320, text: 'signin_with', logo_alignment: 'left' }
            );
        } catch (e) {}
    }

    handleGoogleCredential(credential: string): void {
        this.googleLoading = true;
        this.error = '';
        this.api.googleLogin(credential).subscribe({
            next: (res: any) => {
                this.googleLoading = false;
                const currentUser = {
                    token:     res.token,
                    id:        res.user.id,
                    email:     res.user.email,
                    role:      res.user.role,
                    firstName: res.user.firstName,
                    lastName:  res.user.lastName,
                    phone:     res.user.phone,
                    city:      res.user.city,
                };
                localStorage.setItem('toast', 'true');
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                this.redirectByRole(currentUser.role);
            },
            error: (err: any) => {
                this.googleLoading = false;
                this.error = err?.error?.message || 'Connexion Google échouée.';
            }
        });
    }

    get f() { return this.loginForm.controls; }

    toggleFieldTextType(): void { this.fieldTextType = !this.fieldTextType; }

    fillDemo(user: any): void {
        this.loginForm.patchValue({ email: user.email, password: user.password });
    }

    onSubmit(): void {
        this.submitted = true;
        this.error = '';
        if (this.loginForm.invalid) return;

        this.loading = true;
        const email    = this.f['email'].value.trim().toLowerCase();
        const password = this.f['password'].value;

        this.api.login(email, password).subscribe({
            next: (res: any) => {
                this.loading = false;
                // Sauvegarder token + infos utilisateur
                const currentUser = {
                    token:     res.token,
                    id:        res.user.id,
                    email:     res.user.email,
                    role:      res.user.role,
                    firstName: res.user.firstName,
                    lastName:  res.user.lastName,
                    phone:     res.user.phone,
                    city:      res.user.city,
                };
                localStorage.setItem('toast', 'true');
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                this.redirectByRole(currentUser.role);
            },
            error: (err: any) => {
                this.loading = false;
                if (err?.error?.status === 'pending_approval') {
                    this.error = '⏳ Votre compte vendeur est en attente de validation par l\'administrateur.';
                } else {
                    this.error = err?.error?.message || 'Email ou mot de passe incorrect.';
                }
            }
        });
    }

    private redirectByRole(role: string): void {
        if (role === 'admin')        this.router.navigate(['/admin/reclamations']);
        else if (role === 'vendor')  this.router.navigate(['/ent/dashboard']);
        else                         this.router.navigate(['/users/dashboard']);
    }
}
