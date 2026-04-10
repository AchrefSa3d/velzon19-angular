import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {

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

    constructor(
        private fb: UntypedFormBuilder,
        private router: Router,
        private api: TijaraApiService,
    ) {
        // Si déjà connecté, rediriger directement
        try {
            const raw = sessionStorage.getItem('currentUser');
            if (raw) {
                const user = JSON.parse(raw);
                if (user?.role) { this.redirectByRole(user.role); }
            }
        } catch {
            sessionStorage.removeItem('currentUser');
        }
    }

    ngOnInit(): void {
        this.loginForm = this.fb.group({
            email:    ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
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
                sessionStorage.setItem('toast', 'true');
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
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
