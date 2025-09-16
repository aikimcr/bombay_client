import React, {
  MouseEventHandler,
  ToggleEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  DialogLayout,
  LabeledInput,
  ProtectedRoute,
  TextInput,
} from '../../../Components';
import { ArtistData, ArtistModel } from '../../../Model/ArtistModel';

import './ArtistForm.scss';

interface ArtistFormProps {
  artist?: ArtistModel;
  ref: ReturnType<typeof useRef<HTMLDialogElement>>;
  onClose?: (newArtist: ArtistModel) => void;
  onToggle?: ToggleEventHandler;
}

export const ArtistForm: React.FC<ArtistFormProps> = ({
  artist,
  ref,
  onClose,
  onToggle,
}): React.ReactElement => {
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { register, reset, handleSubmit, formState, setError } =
    useForm<ArtistData>({
      shouldUseNativeValidation: true,
    });

  const onSubmit = (data: ArtistData) => {
    const saveArtist = artist || new ArtistModel({});
    saveArtist.name = data.name;

    saveArtist
      .save()
      .then(() => {
        ref.current?.close();
        onClose?.call(null, saveArtist);
      })
      .catch((err: Error) => {
        console.error(err);
        setError('root.serverError', err);
      });
  };

  const handleReset = (): void => {
    setSubmitDisabled(true);
    reset({
      name: artist?.name || '',
    });
  };

  const handleClose = () => {
    handleReset();
    onClose?.call(null, artist);
  };

  const handleToggle: ToggleEventHandler = (evt) => {
    onToggle?.call(null, evt);
  };

  const closeDialog: MouseEventHandler = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    ref.current?.close();
  };

  useEffect(() => {
    if (formState.isValid && Object.entries(formState.errors).length === 0) {
      setSubmitDisabled(false);
      return;
    }

    setSubmitDisabled(true);
  }, [formState]);

  return (
    <ProtectedRoute>
      <dialog
        ref={ref}
        className="artist-form"
        // As of "@types/react": "^19.1.13" and "@types/react-dom": "^19.1.9"
        // @ts-expect-error Typescript needs to catch up
        closedby="any"
        onClose={handleClose}
        onToggle={handleToggle}
      >
        <DialogLayout headerText="Artist Editor" closeDialog={closeDialog}>
          <form
            className="artist-form__form"
            data-testid="artist-form-form"
            onSubmit={handleSubmit(onSubmit)}
            onReset={handleReset}
          >
            <div className="info">
              <LabeledInput
                inputId="name"
                labelText="Artist Name"
                InputField={TextInput}
                inputProps={{
                  ...register('name', {
                    required: 'Please enter a valid artist name',
                  }),
                  defaultValue: artist?.name,
                  autoComplete: 'artist-name',
                }}
              />
            </div>
            {formState.errors.root && (
              <p>Error saving changes. Please try again later.</p>
            )}
            <div className="controls">
              <Button
                className="clear"
                disabled={false}
                category="secondary"
                text="Clear Form"
                type="reset"
              />
              <Button
                className="login"
                disabled={submitDisabled}
                text="Save"
                type="submit"
              />
            </div>
          </form>
        </DialogLayout>
      </dialog>
    </ProtectedRoute>
  );
};
