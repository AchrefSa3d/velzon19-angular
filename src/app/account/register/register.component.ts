import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TijaraApiService } from 'src/app/core/services/tijara-api.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent implements OnInit {

    signupForm!: UntypedFormGroup;
    submitted       = false;
    loading         = false;
    error           = '';
    fieldTextType   = false;
    pendingApproval = false;
    year: number    = new Date().getFullYear();

    constructor(
        private fb: UntypedFormBuilder,
        private router: Router,
        private api: TijaraApiService
    ) {}

    ngOnInit(): void {
        this.signupForm = this.fb.group({
            role:          ['user'],
            firstName:     ['', Validators.required],
            lastName:      ['', Validators.required],
            phone:         [''],
            city:          [''],
            shopName:      [''],
            companyNumber: [''],
            email:         ['', [Validators.required, Validators.email]],
            password:      ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    get f() { return this.signupForm.controls; }

    setRole(role: string): void {
        this.signupForm.patchValue({ role });
        // Ajouter/retirer validation boutique selon le rôle
        if (role === 'vendor') {
            this.f['shopName'].setValidators(Validators.required);
        } else {
            this.f['shopName'].clearValidators();
        }
        this.f['shopName'].updateValueAndValidity();
    }

    toggleFieldTextType() { this.fieldTextType = !this.fieldTextType; }

    onSubmit() {
        this.submitted = true;
        this.error = '';
        if (this.signupForm.invalid) return;

        this.loading = true;

        this.api.register({
            firstName:     this.f['firstName'].value.trim(),
            lastName:      this.f['lastName'].value.trim(),
            email:         this.f['email'].value.trim().toLowerCase(),
            phone:         this.f['phone'].value.trim(),
            city:          this.f['city'].value.trim(),
            password:      this.f['password'].value,
            role:          this.f['role'].value,
            shopName:      this.f['shopName'].value.trim(),
            companyNumber: this.f['companyNumber'].value.trim(),
        }).subscribe({
            next: (res: any) => {
                this.loading = false;
                if (res.status === 'pending_approval') {
                    this.pendingApproval = true;
                } else {
                    this.router.navigate(['/auth/login']);
                }
            },
            error: (err: any) => {
                this.loading = false;
                this.error = err?.error?.message || 'Erreur lors de l\'inscription';
            }
        });
    }
}
