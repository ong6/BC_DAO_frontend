import { Dialog, Transition } from "@headlessui/react";
import { useWeb3 } from "@openzeppelin/network/lib/react";
import { Field, FieldArray, Form, Formik, useFormikContext } from "formik";
import React, { Fragment, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import projectId from "../../secrets.json";
import { createProposal } from "../api/Api";
import { getCurrentDateTime, showCurrentDate } from "./voteUtils";
import DatePicker from "react-datepicker";

const formTypes = [
  { label: "Loss Voting", value: "loss" },
  { label: "Allocation Proposal", value: "allocation" },
];

const minStakeValues = [
  { label: "No Minimum", value: 0 },
  { label: "1 coin", value: 1 },
  { label: "5 coins", value: 5 },
  { label: "10 coins", value: 10 },
];

let initialType = "loss";
let initialMinStakeVal = 0;

const initialValues = {
  title: "",
  content: "",
  type: initialType,
  options: [{ id: 1, label: "" }],
  min_stake: initialMinStakeVal,
  end_date: getCurrentDateTime(),
};

async function submitProposal(web3, account, values) {
  const finalValues = {
    ...values,
    create_date: getCurrentDateTime(),
    numOfOptions: values.options.length,
    isLossVoting: values.type === "loss",
    isAllocationProposal: values.type === "allocation",
    userId: account,
  };

  const create = await createProposal(web3, account, finalValues);
  return create;
}

const proposalSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
  options: Yup.array().min(2, "Please have at least 2 options"),
});

export default function NewProposal() {
  const web3Context = useWeb3(`wss://mainnet.infura.io/ws/v3/${projectId}`);
  const { lib: web3, accounts } = web3Context;

  //Toast for error messages
  // const errorNotification = (error) =>
  //   toast.info(error, {
  //     position: "bottom-center",
  //     autoClose: 3000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: false,
  //     draggable: true,
  //     progress: undefined,
  //   });

  return (
    <div className="w-full h-full">
      <div className="flex flex-col max-w-7xl mx-auto p-2">
        <div className="flex flex-row items-center justify-between px-4 ">
          <div className="text-4xl text-gray-700 my-4">New Proposal</div>
          <Link to={`/vote`}>
            <div className="bg-gray-200 text-gray-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
              Back to vote
            </div>
          </Link>
        </div>
      </div>
      <div className="max-w-7xl x-auto px-8 py-2">
        <Formik
          initialValues={initialValues}
          validationSchema={proposalSchema}
          validateOnMount={true}
          onSubmit={async (values, actions) => {
            // console.log(JSON.stringify(values));
            // submitProposal(web3, accounts[0], values);
            // actions.setSubmitting(false);
          }}
        >
          {({ values, errors, touched, isValid, setSubmitting }) => (
            <Form>
              <div className="hidden">
                {(values.min_stake = initialMinStakeVal)}
                {(values.type = initialType)}
              </div>

              <div className="flex flex-col text-gray-600 lg:flex-row lg:space-x-4">
                <div className="flex-col w-full">
                  <Field
                    name="title"
                    component={CustomTextInput}
                    label="Title"
                    placeholder="Question"
                    errors={errors}
                    touched={touched}
                  />
                  <Field
                    name="content"
                    component={CustomLongTextInput}
                    label="Content"
                    placeholder="What is your proposal?"
                    errors={errors}
                    touched={touched}
                  />
                  <div className="flex-col w-full border-2 border-gray-200 rounded-xl my-6">
                    <div className="flex flex-row space-x-2  items-end bg-indigo-100 px-4 py-3 text-2xl font-semibold rounded-t-lg">
                      <span>Choices</span>
                      <div className="class">
                        {errors.options && touched.options ? (
                          <div className="text-red-500 font-thin text-sm">
                            require at least 2 options
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <FieldArray name="options">
                      {({ insert, remove, push }) => (
                        <div className="flex flex-col w-full px-4 my-2 space-y-2">
                          {values.options.length > 0 &&
                            values.options.map((friend, index) => (
                              <div
                                className="flex flex-row space-x-2 border-2 border-gray-200 rounded-full items-center font-bold justify-between"
                                key={index}
                              >
                                <div className="pl-8 cursor-default">
                                  {index + 1}
                                </div>
                                <Field
                                  name={`options.${index}.label`}
                                  placeholder="option"
                                  component={CustomOptionInput}
                                />
                                <button
                                  type="button"
                                  className="font-bold w-12"
                                  onClick={() => remove(index)}
                                >
                                  <div className="w-4">X</div>
                                </button>
                              </div>
                            ))}
                          <button
                            type="button"
                            className="p-2 border-2 border-gray-200 rounded-full items-center px-8 font-bold w-full text-center justify-center"
                            onClick={() =>
                              push({ id: values.options.length + 1, label: "" })
                            }
                          >
                            Add option
                          </button>
                        </div>
                      )}
                    </FieldArray>
                  </div>
                </div>
                <div className="flex-col lg:w-96 bg-white rounded-xl border border-gray-200">
                  <div className="border-b border-gray-200 bg-indigo-100 px-8 py-3 rounded-t-lg font-bold text-xl">
                    Actions
                  </div>
                  <div className="p-4">
                    <Field name="type" component={CustomVoteInput} />
                    <Field name="min_stake" component={CustomStakeInput} />
                    <Field name="end_date" component={CustomDateInput} />
                    <button
                      type="submit"
                      disabled={!isValid}
                      className={
                        !isValid
                          ? `w-full rounded-full items-center px-5 py-3 text-sm font-medium text-gray-400 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-gray-400 hover:border-4 transition-all cursor-not-allowed`
                          : `w-full rounded-full items-center px-5 py-3 text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-4 focus:border-4 hover:border-indigo-800 hover:text-black hover:bg-indigo-100 focus:border-purple-200 transition-all`
                      }
                      onClick={() => {
                        submitProposal(web3, accounts[0], values);
                        setSubmitting(false);
                      }}
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

const CustomTextInput = ({ field, ...props }) => (
  <div className="flex flex-col my-2 space-y-1 w-full">
    <div className="flex flex-row space-x-2 items-end">
      <div className="text-gray-500 font-semibold text-2xl">{props.label}</div>
      <div className="class">
        {props.errors.title && props.touched.title ? (
          <div className="text-red-500 font-thin text-sm">required</div>
        ) : null}
      </div>
    </div>
    <input
      type="text"
      {...field}
      {...props}
      className="border border-gray-200 rounded-lg p-2 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-medium"
    />
  </div>
);

const CustomLongTextInput = ({ field, ...props }) => (
  <div className="flex flex-col my-2 space-y-1">
    <div className="flex flex-row space-x-2 items-end">
      <div className="text-gray-500 font-semibold text-2xl">{props.label}</div>
      <div className="class">
        {props.errors.content && props.touched.content ? (
          <div className="text-red-500 font-thin text-sm">required</div>
        ) : null}
      </div>
    </div>
    <textarea
      type="text"
      rows={6}
      {...field}
      {...props}
      className="border border-gray-200 rounded-lg p-2 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-medium"
    />
  </div>
);

const CustomOptionInput = ({ field, ...props }) => (
  <div className="flex flex-col w-full">
    <input
      type="text"
      {...field}
      {...props}
      className="p-2 shadow-sm text-base focus:outline-none focus:border-transparent font-bold text-center"
    />
  </div>
);

function CustomStakeInput({ field, ...props }) {
  let [isOpen, setIsOpen] = useState(false);
  let [stakeLabel, setStakeLabel] = useState(getLabel());
  let buttonRef = useRef(minStakeValues.map(() => React.createRef()));

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function setStake(stake) {
    initialMinStakeVal = stake.value;
    field.min_stake = stake.value;
    setStakeLabel(stake.label);
    closeModal();
  }

  // Get the label corresponding to the value in minStakeValues
  function getLabel() {
    try {
      return minStakeValues.find((stake) => stake.value === field.value).label;
    } catch (error) {
      return "Select Minimum Stake";
    }
  }

  // Get the position of the label in minStakeValues using value
  function getPosition() {
    return minStakeValues.findIndex((stake) => stake.value === field.value);
  }

  return (
    <>
      <div className="flex flex-col w-full">
        <button
          className="w-full rounded-full items-center px-5 py-3 text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-indigo-800 hover:text-black hover:bg-indigo-100 transition-all"
          onClick={openModal}
        >
          {stakeLabel}
        </button>
      </div>
      <Transition appear show={isOpen} as={Fragment} autoFocus={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
          initialFocus={buttonRef.current[getPosition()]}
        >
          <div className="min-h-screen px-4 text-center">
            {/* Allow for clicking outside to close modal*/}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 cursor-default"
                >
                  Select Minimum Stake
                </Dialog.Title>
                <div className="mt-2">
                  {minStakeValues.map((stake, index) => (
                    <button
                      key={stake.value}
                      value={stake.value}
                      type="button"
                      {...field}
                      {...props}
                      ref={buttonRef.current[index]}
                      className="w-full rounded-full items-center px-5 py-3 text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-indigo-800 hover:text-black hover:bg-indigo-100 transition-all focus:ring-2 focus:border-transparent focus:ring-blue-400"
                      onClick={() => setStake(stake)}
                    >
                      {stake.label}
                    </button>
                  ))}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function CustomVoteInput({ field, ...props }) {
  let [isOpen, setIsOpen] = useState(false);
  let buttonRef = useRef(formTypes.map(() => React.createRef()));

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  function setType(type) {
    field.value = type.value;
    initialType = type.value;
    closeModal();
  }

  // Get the label corresponding to the value in formTypes
  function getLabel() {
    try {
      return formTypes.find((type) => type.value === field.value).label;
    } catch (error) {
      return "Select Type";
    }
  }

  // Get the position of the label in formTypes using value
  function getPosition() {
    return formTypes.findIndex((type) => type.value === field.value);
  }

  return (
    <>
      <div className="flex flex-col w-full">
        <button
          className="w-full rounded-full items-center px-5 py-3 text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-indigo-800 hover:text-black hover:bg-indigo-100 transition-all"
          onClick={openModal}
        >
          {getLabel()}
        </button>
      </div>
      <Transition appear show={isOpen} as={Fragment} autoFocus={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
          initialFocus={buttonRef.current[getPosition()]}
        >
          <div className="min-h-screen px-4 text-center">
            {/* Allow for clicking outside to close modal*/}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 cursor-default"
                >
                  Select Type
                </Dialog.Title>
                <div className="mt-2">
                  {formTypes.map((type, index) => (
                    <button
                      key={type.value}
                      value={type.value}
                      type="button"
                      {...field}
                      {...props}
                      ref={buttonRef.current[index]}
                      className="w-full rounded-full items-center px-5 py-3 text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-indigo-800 hover:text-black hover:bg-indigo-100 transition-all focus:ring-2 focus:border-transparent focus:ring-blue-400"
                      onClick={() => setType(type)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function CustomDateInput({ field, ...props }) {
  const { setFieldValue } = useFormikContext();
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="flex flex-col w-full">
        <button
          className="w-full rounded-full items-center px-5 py-3 text-sm font-medium text-indigo-600 bg-white outline-none focus:outline-none m-1 hover:m-0 focus:m-0 border border-indigo-600 hover:border-indigo-800 hover:text-black hover:bg-indigo-100 transition-all"
          onClick={openModal}
        >
          End Date: {showCurrentDate(field.value)}
        </button>
      </div>
      <Transition appear show={isOpen} as={Fragment} autoFocus={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            {/* Allow for clicking outside to close modal*/}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-min px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 cursor-default text-center"
                >
                  Select Date
                </Dialog.Title>
                <div className="mt-2">
                  <DatePicker
                    {...field}
                    {...props}
                    selected={(field.value && new Date(field.value)) || null}
                    onChange={(val) => {
                      setFieldValue(field.name, val.getTime());
                    }}
                    inline
                    className="rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <div className="text-center">
                    <button
                      className="rounded-full border border-purple-400 p-1 px-3 text-purple-600 text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent focus:bg-gray-100"
                      onClick={closeModal}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
