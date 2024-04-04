import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./profile-form.component.scss'],
})
export class ProfileFormComponent implements OnInit {
  profileForm!: FormGroup;
  errorMessage: string = '';
  maxDate: string = '';

  @Output() formSubmitted = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUserData().subscribe((userData) => {
      if (userData) this.profileForm = this.setProfileData(userData);
    });

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      designation: ['', Validators.required],
      profilePicture: [null],
      age: ['', Validators.required],
      profileSummary: ['', Validators.required],
      workExperiences: this.fb.array([]),
    });

    this.maxDate = new Date().toISOString().split('T')[0];
  }

  get workExperiences(): FormArray {
    return this.profileForm.get('workExperiences') as FormArray;
  }

  formatDate(dateString: string | null): string | null {
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  setProfileData(userData: any): FormGroup {
    return this.fb.group({
      name: [userData.name],
      age: [userData.age],
      designation: [userData.designation],
      profilePicture: [userData.profilePicture],
      profileSummary: [userData.profileSummary],

      workExperiences: this.fb.array(
        userData.workExperiences.map((workExp: any) => {
          return this.fb.group({
            startDate: [this.formatDate(workExp.startDate)],
            endDate: [this.formatDate(workExp.endDate)],
            current: [workExp.current],
            jobTitle: [workExp.jobTitle],
            company: [workExp.company],
            jobDescription: [workExp.jobDescription],
          });
        })
      ),
    });
  }

  addWorkExperience() {
    const newWorkExperience = this.fb.group({
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      jobDescription: ['', Validators.required],
    });
    this.workExperiences.push(newWorkExperience);
  }

  onSubmit() {
    this.markFormGroupTouched(this.profileForm);

    if (this.profileForm.valid) {
      const workExperiences = this.profileForm.get(
        'workExperiences'
      ) as FormArray;

      if (workExperiences.length === 0) {
        this.errorMessage = 'At least one work experience should be added.';
        return;
      }

      const formData = new FormData();

      formData.append('name', this.profileForm.get('name')!.value);
      formData.append('age', this.profileForm.get('age')!.value);
      formData.append(
        'designation',
        this.profileForm.get('designation')!.value
      );
      formData.append(
        'profileSummary',
        this.profileForm.get('profileSummary')!.value
      );

      const profilePicture = this.profileForm.get('profilePicture')!.value;
      if (profilePicture instanceof File) {
        formData.append('profilePicture', profilePicture);
      }

      workExperiences.controls.forEach((control, index) => {
        formData.append(
          `workExperiences[${index}][startDate]`,
          control.get('startDate')!.value
        );
        formData.append(
          `workExperiences[${index}][endDate]`,
          control.get('current')!.value ? '' : control.get('endDate')!.value
        );
        formData.append(
          `workExperiences[${index}][current]`,
          control.get('current')!.value ? 'true' : 'false'
        );
        formData.append(
          `workExperiences[${index}][jobTitle]`,
          control.get('jobTitle')!.value
        );
        formData.append(
          `workExperiences[${index}][company]`,
          control.get('company')!.value
        );
        formData.append(
          `workExperiences[${index}][jobDescription]`,
          control.get('jobDescription')!.value
        );
      });

      this.userService.submitProfile(formData).subscribe({
        next: (response) => {
          console.log('Profile submitted successfully:', response);
          this.formSubmitted.emit();
        },
        error: (err) => {
          console.error('Error submitting profile:', err);
          this.errorMessage = err.error.errors[0];
        },
      });
    }
  }

  removeWorkExperience(index: number) {
    this.workExperiences.removeAt(index);
  }

  onProfilePictureSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileForm.get('profilePicture')!.setValue(file);
    }
  }

  markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}